import { useId } from 'react'
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"

export function CustomPagination({ table, totalElements, label = "registros" }) {
  const id = useId()
  const { pageIndex, pageSize } = table.getState().pagination
  const from = pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, totalElements)

  return (
    <div className='flex items-center justify-between gap-8 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm'>
      
      {/* IZQUIERDA: Filas por página */}
      <div className='flex items-center gap-3'>
        <Label htmlFor={id} className='text-sm font-black uppercase tracking-widest text-gray-400 max-sm:sr-only'>
          Filas por página
        </Label>
        <Select
          value={pageSize.toString()}
          onValueChange={value => table.setPageSize(Number(value))}
        >
          <SelectTrigger id={id} className='w-fit h-9 rounded-xl border-gray-200 font-bold text-brand-primary'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className='rounded-xl border-none shadow-2xl'>
            {[5, 10, 25, 50].map(size => (
              <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* CENTRO: Contador genérico */}
      <div className='flex grow justify-center'>
        <p className='text-gray-400 text-xs font-bold uppercase tracking-tighter italic'>
          Mostrando <span className='text-brand-primary font-black'>{from}-{to}</span> de <span className='text-brand-primary font-black'>{totalElements}</span> {label}
        </p>
      </div>

      {/* DERECHA: Controles */}
      <div>
        <Pagination>
          <PaginationContent className="gap-1">
            <PaginationItem>
              <Button
                size='icon'
                variant='outline'
                className='h-9 w-9 rounded-xl border-slate-200 text-brand-primary hover:bg-brand-primary hover:text-white disabled:opacity-30 transition-all'
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronFirst className="h-6 w-6" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size='icon'
                variant='outline'
                className='h-9 w-9 rounded-xl border-slate-200 text-brand-primary hover:bg-brand-primary hover:text-white disabled:opacity-30 transition-all'
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size='icon'
                variant='outline'
                className='h-9 w-9 rounded-xl border-slate-200 text-brand-primary hover:bg-brand-primary hover:text-white disabled:opacity-30 transition-all'
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size='icon'
                variant='outline'
                className='h-9 w-9 rounded-xl border-slate-200 text-brand-primary hover:bg-brand-primary hover:text-white disabled:opacity-30 transition-all'
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronLast className="h-6 w-6" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}