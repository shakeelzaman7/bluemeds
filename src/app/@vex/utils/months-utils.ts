export function getMonthByNumber(monthNumber: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (monthNumber < 1 || monthNumber > 12) {
    throw new Error('Month number must be between 1 and 12');
  }

  return months[monthNumber - 1];
}