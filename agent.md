now there are two separate folders one is frontend and the other is backend the frontend is built with vite + react and the backend is built with djngo now I have to create a support ticket component architect the frontend as moduler type in seperate folders style such as components/ etc 
this is a iot based support system so you just need to build the whole component of the support ticket
here is the steps:
1. Tickets
2. visiting report and for admin it will be visiting info distinguise with super-admin or normal user prop

here use postgres sql for production
and for storage use storage s3 bucket
here in the ticket section :
 the company user can send ticket to the super_admin :
 /tickets in this route the comnay admin can see their tickets 
  here in the from this is the required fields:
 1. Title/problem summery it will be a text field 
 2. Affected system it is dropdown selection it should be configurable you can do a js object if I put any key it will dynamically  added 
 3. Problem category it will be also same dynamic
 4. urgency level will be fixed low, medium, high, critical 
 5. priority level will be same fixed low,medium, high and critical
 6. describe the problem in detail 
 7. and finally file upload optin they can upload a picture and also a video for storage use s3 storage for now use supabase and you can use s3 compitiable in django
/tickets(super_admin):
1. super admin can see the requested ticket sent by the company admin ok 
/visiting-log 
in this route super admin will send an acknoledgement ticket 
the options:
company field 
visiting date
number of persons
responsible phone numbers
reson
select work performed it will be a checklist and it will be dynamic you can create this with a js object
this is the fields 


this is the ticket add route the next
/visiting report here the visiting report will be what the super_admin sent for acknoledgement for the company
for role you can pass a prop to dect the role 
here for ticket here customer and the company admin can directly live chat to the superadmin you should do that by websocket 
use docker for all frontend and backend .


use proper pagination in the frontend ok 