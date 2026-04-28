import { flexRender } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export function DataTable({ table }) {
  return (
    <div className="w-full">
        <Table className="w-full rounded-cineflix border-collapse bg-white shadow">
          <TableHeader className="bg-gray-100 text-base">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-gray-500 font-bold">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="text-base">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
               <TableCell colSpan={10} className="h-32 text-center text-slate-400">
                No hay películas registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
    </div>
  )
}