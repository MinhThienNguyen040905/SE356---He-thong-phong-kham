import jsPDF from 'jspdf'
import { convertVietnameseToAscii } from './vietnameseUtils'
import type { Prescription } from '../types/prescription.types'



export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

export const calculateAge = (dateOfBirth: string) => {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}


export const generatePrescriptionPDF = async (prescription: Prescription): Promise<void> => {
  console.log('Generating PDF for prescription:', prescription.id)
  
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  
  const doc = new jsPDF('p', 'mm', 'a4')
  
  
  doc.setFont('times', 'normal')
  
  let yPosition = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  
  
  doc.setFontSize(20)
  doc.setFont('times', 'bold')
  doc.text('DON THUOC', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 10
  
  doc.setFontSize(14)
  doc.setFont('times', 'normal')
  doc.text(prescription.prescriptionCode, pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 15
  
  
  doc.setFontSize(10)
  doc.text(`Ngay ke: ${formatDate(prescription.createdAt)}`, pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 15
  
  
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10
  
  
  doc.setFontSize(12)
  doc.setFont('times', 'bold')
  doc.text('THONG TIN BENH NHAN', margin, yPosition)
  yPosition += 8
  
  doc.setFont('times', 'normal')
  doc.setFontSize(10)
  
  
  const patientName = convertVietnameseToAscii(prescription.patient.fullName)
  const patientAddress = prescription.patient.address ? convertVietnameseToAscii(prescription.patient.address) : ''
  
  doc.text(`Ho va ten: ${patientName}`, margin, yPosition)
  yPosition += 6
  doc.text(`Tuoi: ${calculateAge(prescription.patient.dateOfBirth)} tuoi`, margin, yPosition)
  doc.text(`Gioi tinh: ${prescription.patient.gender === 'MALE' ? 'Nam' : prescription.patient.gender === 'FEMALE' ? 'Nu' : 'Khac'}`, margin + 80, yPosition)
  yPosition += 6
  doc.text(`So dien thoai: ${prescription.patient.phoneNumber}`, margin, yPosition)
  yPosition += 6
  if (patientAddress) {
    const addressLines = doc.splitTextToSize(`Dia chi: ${patientAddress}`, contentWidth)
    doc.text(addressLines, margin, yPosition)
    yPosition += addressLines.length * 6
  }
  yPosition += 5
  
  
  doc.setFont('times', 'bold')
  doc.setFontSize(12)
  doc.text('THONG TIN BAC SI', margin, yPosition)
  yPosition += 8
  
  doc.setFont('times', 'normal')
  doc.setFontSize(10)
  
  const doctorName = convertVietnameseToAscii(prescription.doctor.fullName)
  const doctorSpecialty = convertVietnameseToAscii(prescription.doctor.specialty)
  const doctorDegree = prescription.doctor.degree ? convertVietnameseToAscii(prescription.doctor.degree) : ''
  
  doc.text(`Ho va ten: ${doctorName}`, margin, yPosition)
  yPosition += 6
  doc.text(`Chuyen khoa: ${doctorSpecialty}`, margin, yPosition)
  yPosition += 6
  if (doctorDegree) {
    doc.text(`Hoc vi: ${doctorDegree}`, margin, yPosition)
    yPosition += 6
  }
  yPosition += 5
  
  
  if (prescription.visit && (prescription.visit.diagnosis || prescription.visit.symptoms)) {
    doc.setFont('times', 'bold')
    doc.setFontSize(12)
    doc.text('THONG TIN KHAM BENH', margin, yPosition)
    yPosition += 8
    
    doc.setFont('times', 'normal')
    doc.setFontSize(10)
    if (prescription.visit.diagnosis) {
      const diagnosis = convertVietnameseToAscii(prescription.visit.diagnosis)
      const diagnosisLines = doc.splitTextToSize(`Chan doan: ${diagnosis}`, contentWidth)
      doc.text(diagnosisLines, margin, yPosition)
      yPosition += diagnosisLines.length * 6
    }
    if (prescription.visit.symptoms) {
      const symptoms = convertVietnameseToAscii(prescription.visit.symptoms)
      const symptomsLines = doc.splitTextToSize(`Trieu chung: ${symptoms}`, contentWidth)
      doc.text(symptomsLines, margin, yPosition)
      yPosition += symptomsLines.length * 6
    }
    yPosition += 5
  }
  
  
  doc.setFont('times', 'bold')
  doc.setFontSize(12)
  doc.text(`CHI TIET THUOC (${prescription.details.length} loai)`, margin, yPosition)
  yPosition += 10
  
  
  doc.setFontSize(9)
  doc.setFont('times', 'bold')
  const colWidths = [15, 50, 20, 15, 15, 15, 15, 15, 30]
  const headers = ['STT', 'Ten thuoc', 'SL', 'DV', 'Sang', 'Trua', 'Chieu', 'Toi', 'Thanh tien']
  
  let xPos = margin
  headers.forEach((header, index) => {
    doc.text(header, xPos, yPosition)
    xPos += colWidths[index]
  })
  yPosition += 8
  
  
  doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2)
  
  
  doc.setFont('times', 'normal')
  prescription.details.forEach((detail, index) => {
    if (yPosition > 250) { 
      doc.addPage()
      yPosition = 20
    }
    
    xPos = margin
    const medicineName = convertVietnameseToAscii(detail.medicineName)
    const medicineUnit = convertVietnameseToAscii(detail.unit)
    
    const rowData = [
      (index + 1).toString(),
      medicineName.length > 25 ? medicineName.substring(0, 25) + '...' : medicineName,
      detail.quantity.toString(),
      medicineUnit,
      detail.dosageMorning.toString() || '0',
      detail.dosageNoon.toString() || '0',
      detail.dosageAfternoon.toString() || '0',
      detail.dosageEvening.toString() || '0',
      formatCurrency(detail.quantity * detail.unitPrice).replace('₫', 'VND')
    ]
    
    rowData.forEach((data, colIndex) => {
      if (colIndex === 1) { 
        const lines = doc.splitTextToSize(data, colWidths[colIndex] - 2)
        doc.text(lines, xPos, yPosition)
      } else if (colIndex === 8) { 
        doc.text(data, xPos + colWidths[colIndex] - 2, yPosition, { align: 'right' })
      } else {
        doc.text(data, xPos, yPosition)
      }
      xPos += colWidths[colIndex]
    })
    yPosition += 8
    
    
    if (detail.instruction) {
      doc.setFontSize(8)
      doc.setFont('times', 'italic')
      const instruction = convertVietnameseToAscii(detail.instruction)
      const instructionLines = doc.splitTextToSize(`HD: ${instruction}`, contentWidth - 20)
      doc.text(instructionLines, margin + 10, yPosition)
      yPosition += instructionLines.length * 5
      doc.setFontSize(9)
      doc.setFont('times', 'normal')
    }
    yPosition += 2
  })
  
  
  yPosition += 5
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 8
  doc.setFont('times', 'bold')
  doc.setFontSize(12)
  doc.text('TONG CONG:', pageWidth - margin - 60, yPosition)
  doc.text(formatCurrency(prescription.totalAmount).replace('₫', 'VND'), pageWidth - margin, yPosition, { align: 'right' })
  yPosition += 15
  
  
  if (prescription.note) {
    doc.setFont('times', 'bold')
    doc.setFontSize(10)
    doc.text('GHI CHU CUA BAC SI:', margin, yPosition)
    yPosition += 8
    doc.setFont('times', 'normal')
    const note = convertVietnameseToAscii(prescription.note)
    const noteLines = doc.splitTextToSize(note, contentWidth)
    doc.text(noteLines, margin, yPosition)
    yPosition += noteLines.length * 6 + 10
  }
  
  
  yPosition += 10
  doc.setFont('times', 'bold')
  doc.setFontSize(10)
  doc.text('Bac si ke don', pageWidth - margin - 40, yPosition, { align: 'center' })
  yPosition += 20
  doc.text(doctorName, pageWidth - margin - 40, yPosition, { align: 'center' })
  
  
  doc.save(`Prescription_${prescription.prescriptionCode}.pdf`)
  
  console.log('PDF generated successfully')
}


export const printPrescription = (prescription: Prescription, onError: (error: string) => void): void => {
  
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    onError('Không thể mở cửa sổ in. Vui lòng kiểm tra popup blocker.')
    return
  }

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Đơn Thuốc - ${prescription.prescriptionCode}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
        
        body { 
          font-family: 'Roboto', Arial, sans-serif; 
          margin: 20px; 
          line-height: 1.6;
          color: #333;
        }
        .header { 
          text-align: center; 
          border-bottom: 2px solid #333; 
          padding-bottom: 20px; 
          margin-bottom: 20px; 
        }
        .info-section { 
          margin-bottom: 20px; 
        }
        .info-row { 
          display: flex; 
          margin-bottom: 10px; 
        }
        .info-label { 
          font-weight: bold; 
          width: 150px; 
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0; 
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        th { 
          background-color: #f2f2f2; 
          font-weight: bold; 
        }
        .total { 
          font-weight: bold; 
          font-size: 1.1em; 
        }
        .note { 
          margin-top: 20px; 
          padding: 15px; 
          background-color: #f9f9f9; 
          border-left: 4px solid #007bff; 
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ĐƠN THUỐC</h1>
        <h2>${prescription.prescriptionCode}</h2>
        <p>Ngày kê: ${formatDate(prescription.createdAt)}</p>
      </div>

      <div class="info-section">
        <h3>Thông tin bệnh nhân</h3>
        <div class="info-row">
          <span class="info-label">Họ và tên:</span>
          <span>${prescription.patient.fullName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tuổi:</span>
          <span>${calculateAge(prescription.patient.dateOfBirth)} tuổi</span>
        </div>
        <div class="info-row">
          <span class="info-label">Giới tính:</span>
          <span>${prescription.patient.gender === 'MALE' ? 'Nam' : prescription.patient.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Số điện thoại:</span>
          <span>${prescription.patient.phoneNumber}</span>
        </div>
        ${prescription.patient.address ? `
        <div class="info-row">
          <span class="info-label">Địa chỉ:</span>
          <span>${prescription.patient.address}</span>
        </div>
        ` : ''}
      </div>

      <div class="info-section">
        <h3>Thông tin bác sĩ</h3>
        <div class="info-row">
          <span class="info-label">Họ và tên:</span>
          <span>${prescription.doctor.fullName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Chuyên khoa:</span>
          <span>${prescription.doctor.specialty}</span>
        </div>
        ${prescription.doctor.degree ? `
        <div class="info-row">
          <span class="info-label">Học vị:</span>
          <span>${prescription.doctor.degree}</span>
        </div>
        ` : ''}
      </div>

      ${prescription.visit && (prescription.visit.diagnosis || prescription.visit.symptoms) ? `
      <div class="info-section">
        <h3>Thông tin khám bệnh</h3>
        ${prescription.visit.diagnosis ? `
        <div class="info-row">
          <span class="info-label">Chẩn đoán:</span>
          <span>${prescription.visit.diagnosis}</span>
        </div>
        ` : ''}
        ${prescription.visit.symptoms ? `
        <div class="info-row">
          <span class="info-label">Triệu chứng:</span>
          <span>${prescription.visit.symptoms}</span>
        </div>
        ` : ''}
      </div>
      ` : ''}

      <div class="info-section">
        <h3>Chi tiết thuốc</h3>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên thuốc</th>
              <th>Số lượng</th>
              <th>Đơn vị</th>
              <th>Sáng</th>
              <th>Trưa</th>
              <th>Chiều</th>
              <th>Tối</th>
              <th>Hướng dẫn</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${prescription.details.map((detail, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${detail.medicineName}</td>
                <td>${detail.quantity}</td>
                <td>${detail.unit}</td>
                <td>${detail.dosageMorning || '-'}</td>
                <td>${detail.dosageNoon || '-'}</td>
                <td>${detail.dosageAfternoon || '-'}</td>
                <td>${detail.dosageEvening || '-'}</td>
                <td>${detail.instruction || '-'}</td>
                <td>${formatCurrency(detail.quantity * detail.unitPrice)}</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td colspan="9">Tổng cộng:</td>
              <td>${formatCurrency(prescription.totalAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      ${prescription.note ? `
      <div class="note">
        <h4>Ghi chú của bác sĩ:</h4>
        <p>${prescription.note}</p>
      </div>
      ` : ''}

      <div style="margin-top: 40px; text-align: right;">
        <p><strong>Bác sĩ kê đơn</strong></p>
        <br><br>
        <p>${prescription.doctor.fullName}</p>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(printContent)
  printWindow.document.close()
  
  
  printWindow.onload = () => {
    printWindow.print()
    printWindow.close()
  }
}