from django.contrib import admin

from accounts.models import Company, Profile
from core.models import DynamicOption
from tickets.models import Ticket, TicketAttachment, TicketMessage
from visits.models import VisitingLog

admin.site.register([Company, Profile, DynamicOption, Ticket, TicketAttachment, TicketMessage, VisitingLog])
