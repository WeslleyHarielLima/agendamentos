import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

type CalendarProps = {
  mes: string;
  dataSelecionada: string;
  diasComAgendamento: Set<number>;
};

type DiaCell = {
  day: number;
  currentMonth: boolean;
  dateStr: string;
};

function buildCells(mes: string): DiaCell[] {
  const [year, month] = mes.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startDayOfWeek = firstDay.getDay();

  const cells: DiaCell[] = [];

  const prevYear = month === 1 ? year - 1 : year;
  const prevMonthNum = month === 1 ? 12 : month - 1;
  const prevMonthDays = new Date(year, month - 1, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    cells.push({
      day,
      currentMonth: false,
      dateStr: `${prevYear}-${String(prevMonthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      currentMonth: true,
      dateStr: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    });
  }

  const nextYear = month === 12 ? year + 1 : year;
  const nextMonthNum = month === 12 ? 1 : month + 1;
  const totalRows = Math.ceil(cells.length / 7);
  const totalCells = totalRows * 7;
  const remaining = totalCells - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({
      day: d,
      currentMonth: false,
      dateStr: `${nextYear}-${String(nextMonthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    });
  }

  return cells;
}

export function Calendar({
  mes,
  dataSelecionada,
  diasComAgendamento,
}: CalendarProps) {
  const [year, month] = mes.split('-').map(Number);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const prevMonth =
    month === 1
      ? `${year - 1}-12`
      : `${year}-${String(month - 1).padStart(2, '0')}`;

  const nextMonth =
    month === 12
      ? `${year + 1}-01`
      : `${year}-${String(month + 1).padStart(2, '0')}`;

  const cells = buildCells(mes);

  return (
    <div className="bg-background-tertiary rounded-xl p-4 select-none">
      {/* Cabeçalho de navegação */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href={`/?mes=${prevMonth}`}
          className="p-1.5 rounded-lg text-content-secondary hover:text-content-primary hover:bg-background-secondary transition-colors"
        >
          <ChevronLeft className="size-4" />
        </Link>

        <span className="text-label-medium-size text-content-primary">
          {MESES[month - 1]} {year}
        </span>

        <Link
          href={`/?mes=${nextMonth}`}
          className="p-1.5 rounded-lg text-content-secondary hover:text-content-primary hover:bg-background-secondary transition-colors"
        >
          <ChevronRight className="size-4" />
        </Link>
      </div>

      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 mb-1">
        {DIAS_SEMANA.map((dia) => (
          <div
            key={dia}
            className="text-center text-paragraph-small-size text-content-tertiary py-1"
          >
            {dia}
          </div>
        ))}
      </div>

      {/* Grade de dias */}
      <div className="grid grid-cols-7">
        {cells.map((cell) => {
          const isToday = cell.dateStr === todayStr;
          const isSelected = cell.dateStr === dataSelecionada;
          const hasAppointment =
            cell.currentMonth && diasComAgendamento.has(cell.day);

          let cellClass =
            'relative flex flex-col items-center justify-center aspect-square rounded-lg transition-colors ';

          if (!cell.currentMonth) {
            cellClass += 'text-content-tertiary opacity-30 pointer-events-none';
          } else if (isSelected) {
            cellClass += 'bg-content-brand text-white font-bold';
          } else if (isToday) {
            cellClass +=
              'bg-content-brand/15 text-content-brand font-bold ring-1 ring-content-brand/50 hover:bg-content-brand/25';
          } else {
            cellClass +=
              'text-content-primary hover:bg-background-secondary cursor-pointer';
          }

          return (
            <Link
              key={cell.dateStr}
              href={
                cell.currentMonth ? `/?mes=${mes}&data=${cell.dateStr}` : '#'
              }
              tabIndex={cell.currentMonth ? 0 : -1}
              className={cellClass}
            >
              <span className="text-paragraph-small-size leading-none">
                {cell.day}
              </span>
              {hasAppointment && (
                <span
                  className={`absolute bottom-1 size-1 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-content-brand'
                  }`}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
