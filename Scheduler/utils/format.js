
function getDateFrom3MonthsAgo() {
  const dataAtual = new Date();
  
  dataAtual.setMonth(dataAtual.getMonth() - 3);

  return formatarData(dataAtual);
}

function formatarData(data = new Date()) {
    // Extrair o dia, mês e ano
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();

    // Formatar no formato dd-mm-aaaa
    return `${dia}-${mes}-${ano}`;
}
function formatarHorario(data = new Date()) {
    // Extrair horas, minutos e segundos
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    const segundos = String(data.getSeconds()).padStart(2, '0');
  
    // Formatar no formato hh-mm-ss
    return `${horas}-${minutos}`;
  }
module.exports = {formatarData, formatarHorario, getDateFrom3MonthsAgo};