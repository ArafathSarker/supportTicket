from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from . import conf
from .models import Ticket, TicketMessage


class TicketChatConsumer(AsyncJsonWebsocketConsumer):
    """Live chat for a single ticket: /ws/tickets/<id>/chat/?token=<jwt>."""

    async def connect(self):
        user = self.scope.get('user')
        self.ticket_id = self.scope['url_route']['kwargs']['ticket_id']

        if user is None or not user.is_authenticated:
            await self.close(code=4401)
            return

        allowed = await self.can_access(user)
        if not allowed:
            await self.close(code=4403)
            return

        self.group_name = f'support_ticket_{self.ticket_id}_chat'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content):
        message = (content.get('message') or '').strip()
        if not message:
            return
        msg = await self.save_message(self.scope['user'], message)
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat.message',
                'message': {
                    'id': msg.id,
                    'ticket': self.ticket_id,
                    'sender': msg.sender_id,
                    'sender_username': msg.sender.get_username(),
                    'sender_role': conf.resolve_role(msg.sender),
                    'content': msg.content,
                    'created_at': msg.created_at.isoformat(),
                },
            },
        )

    async def chat_message(self, event):
        await self.send_json({'type': 'chat.message', 'message': event['message']})

    # -- helpers ------------------------------------------------------------

    @database_sync_to_async
    def can_access(self, user) -> bool:
        """Super admins may join any ticket chat; only the ticket author otherwise."""
        if conf.is_super_admin(user):
            return True
        try:
            ticket = Ticket.objects.get(pk=self.ticket_id)
        except Ticket.DoesNotExist:
            return False
        company = conf.user_company(user)
        return company is not None and ticket.company_id == company.pk

    @database_sync_to_async
    def save_message(self, user, content):
        return TicketMessage.objects.create(
            ticket_id=self.ticket_id, sender=user, content=content
        )
