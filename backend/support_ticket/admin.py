from django.contrib import admin

from .models import DynamicOption, Ticket, TicketAttachment, TicketMessage, VisitingLog

admin.site.register([DynamicOption, Ticket, TicketAttachment, TicketMessage, VisitingLog])
