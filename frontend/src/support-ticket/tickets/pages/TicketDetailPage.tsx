import { useParams } from 'react-router-dom'
import { TicketDetail } from '../components/TicketDetail'

export function TicketDetailPage() {
  const { id } = useParams()
  return <TicketDetail ticketId={Number(id)} />
}
