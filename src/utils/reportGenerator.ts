import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  // Header
  doc.setFontSize(20);
  doc.setTextColor(26, 31, 44); // Slate 900
  doc.text(data.workshopName, 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(`Relatório Gerencial de Faturamento`, 14, 30);
  doc.text(`Período: ${data.period}`, 14, 35);
  doc.text(`Emitido em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, pageWidth - 14, 35, { align: "right" });

  // Summary Cards (Rectangles)
  const cardWidth = (pageWidth - 40) / 3;
  const cardY = 45;
  const cardHeight = 25;

  // Revenue Card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, cardY, cardWidth, cardHeight, 3, 3, "FD");
  doc.setTextColor(16, 185, 129); // Emerald 500
  doc.setFontSize(8);
  doc.text("RECEITA TOTAL", 18, cardY + 7);
  doc.setFontSize(12);
  doc.text(`R$ ${data.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 18, cardY + 18);

  // Parts Card
  doc.roundedRect(14 + cardWidth + 6, cardY, cardWidth, cardHeight, 3, 3, "FD");
  doc.setTextColor(6, 182, 212); // Cyan 500
  doc.setFontSize(8);
  doc.text("PEÇAS", 20 + cardWidth + 6, cardY + 7);
  doc.setFontSize(12);
  doc.text(`R$ ${data.totalParts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 20 + cardWidth + 6, cardY + 18);

  // Services Card
  doc.roundedRect(14 + (cardWidth + 6) * 2, cardY, cardWidth, cardHeight, 3, 3, "FD");
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.setFontSize(8);
  doc.text("MÃO DE OBRA", 20 + (cardWidth + 6) * 2, cardY + 7);
  doc.setFontSize(12);
  doc.text(`R$ ${data.totalServices.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 20 + (cardWidth + 6) * 2, cardY + 18);

  // Detailed Table
  autoTable(doc, {
    startY: 80,
    head: [["Data", "OS", "Cliente", "Veículo", "Valor Total"]],
    body: data.orders.map((os) => [
      format(new Date(os.data_conclusao || os.created_at), "dd/MM/yy"),
      os.id.substring(0, 8).toUpperCase(),
      os.clientes?.nome || "N/A",
      os.veiculos ? `${os.veiculos.modelo} (${os.veiculos.placa})` : "N/A",
      `R$ ${os.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    ]),
    headStyles: {
      fillColor: [26, 31, 44],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { top: 80 },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
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
