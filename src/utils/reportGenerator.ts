import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format, parseISO, startOfDay, eachDayOfInterval, isSameDay } from "date-fns";

interface ReportData {
  workshopName: string;
  period: string;
  totalRevenue: number;
  totalParts: number;
  totalServices: number;
  orders: any[];
}

export const generateFinancialReport = (data: ReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Colors - professional blues
  const primaryBlue = [30, 64, 175]; // Blue 800
  const lightBlue = [219, 234, 254]; // Blue 100
  const textDark = [30, 41, 59]; // Slate 800
  const textMuted = [100, 116, 139]; // Slate 500

  // Header
  doc.setFontSize(22);
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text(data.workshopName, 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Relatório Gerencial de Faturamento`, 14, 30);
  doc.text(`Período: ${data.period}`, 14, 35);
  doc.text(`Emitido em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, pageWidth - 14, 35, { align: "right" });

  // Summary Cards
  const cardWidth = (pageWidth - 40) / 3;
  const cardY = 45;
  const cardHeight = 28;

  const drawCard = (x: number, title: string, value: number, color: number[]) => {
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, "FD");
    
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(title, x + 4, cardY + 8);
    
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFontSize(13);
    doc.text(`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, x + 4, cardY + 20);
  };

  drawCard(14, "RECEITA TOTAL", data.totalRevenue, primaryBlue);
  drawCard(14 + cardWidth + 6, "PEÇAS", data.totalParts, [59, 130, 246]); // Blue 500
  drawCard(14 + (cardWidth + 6) * 2, "MÃO DE OBRA", data.totalServices, [100, 116, 139]);

  // --- Line Chart: Faturamento Diário ---
  const chartY = 85;
  const chartHeight = 40;
  const chartWidth = pageWidth - 28;

  // Prepare data for chart
  const ordersByDay = data.orders.reduce((acc: any, os) => {
    const day = format(new Date(os.data_conclusao || os.created_at), "yyyy-MM-dd");
    acc[day] = (acc[day] || 0) + (os.valor_total || 0);
    return acc;
  }, {});

  const dates = Object.keys(ordersByDay).sort();
  const values = dates.map(d => ordersByDay[d]);
  const maxValue = Math.max(...values, 100);

  // Draw chart title
  doc.setFontSize(10);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("Tendência de Faturamento Diário", 14, chartY - 5);

  // Draw chart axes
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.2);
  doc.line(14, chartY, 14, chartY + chartHeight); // Y
  doc.line(14, chartY + chartHeight, 14 + chartWidth, chartY + chartHeight); // X

  if (dates.length > 1) {
    const stepX = chartWidth / (dates.length - 1);
    doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setLineWidth(0.5);

    dates.forEach((date, i) => {
      const x = 14 + (i * stepX);
      const y = chartY + chartHeight - (ordersByDay[date] / maxValue * chartHeight);

      if (i > 0) {
        const prevX = 14 + ((i - 1) * stepX);
        const prevY = chartY + chartHeight - (ordersByDay[dates[i - 1]] / maxValue * chartHeight);
        doc.line(prevX, prevY, x, y);
      }
      
      doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.circle(x, y, 0.8, "F");
      
      // Draw minimal date labels for start and end
      if (i === 0 || i === dates.length - 1) {
        doc.setFontSize(6);
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        doc.text(format(parseISO(date), "dd/MM"), x - 3, chartY + chartHeight + 5);
      }
    });
  } else if (dates.length === 1) {
     const x = 14 + (chartWidth / 2);
     const y = chartY + chartHeight - (values[0] / maxValue * chartHeight);
     doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
     doc.circle(x, y, 1, "F");
     doc.setFontSize(6);
     doc.text(format(parseISO(dates[0]), "dd/MM"), x - 3, chartY + chartHeight + 5);
  }

  // Detailed Table
  autoTable(doc, {
    startY: 140,
    head: [["Data", "OS", "Cliente", "Veículo", "Valor Total"]],
    body: data.orders.map((os) => [
      format(new Date(os.data_conclusao || os.created_at), "dd/MM/yy"),
      os.id.substring(0, 8).toUpperCase(),
      os.clientes?.nome || "N/A",
      os.veiculos ? `${os.veiculos.modelo} (${os.veiculos.placa})` : "N/A",
      `R$ ${os.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    ]),
    headStyles: {
      fillColor: primaryBlue,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: textDark,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { top: 140 },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Página ${i} de ${pageCount} - Gerado por Oficina em Ordem`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  doc.save(`Relatorio_Financeiro_${data.period.replace(/\//g, "-")}.pdf`);
};
