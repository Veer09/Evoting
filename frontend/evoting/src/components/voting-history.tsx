import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function VotingHistory() {
  const history = [
    {
      id: "1",
      election: "Presidential Election 2024",
      date: "May 10, 2024",
      status: "Confirmed",
      txHash: "0x1a2b3c4d5e6f7g8h9i0j",
    },
    {
      id: "2",
      election: "City Council Election",
      date: "April 25, 2024",
      status: "Confirmed",
      txHash: "0x2b3c4d5e6f7g8h9i0j1k",
    },
    {
      id: "3",
      election: "Mayoral Election",
      date: "January 12, 2024",
      status: "Confirmed",
      txHash: "0x3c4d5e6f7g8h9i0j1k2l",
    },
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Election</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden md:table-cell">Transaction</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.election}</TableCell>
            <TableCell>{item.date}</TableCell>
            <TableCell>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {item.status}
              </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <span className="font-mono text-xs">{item.txHash.substring(0, 10)}...</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

