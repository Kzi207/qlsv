import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function testExcel() {
  try {
    // 1. Find an activity session (class_id is null)
    const session = await prisma.attendanceSession.findFirst({
      where: { class_id: null },
      include: { class: true },
    });

    if (!session) {
      console.log('No activity session found in database to test.');
      return;
    }

    console.log('Testing Excel export for Activity Session:', {
      id: session.id,
      title: session.title,
      class_id: session.class_id,
    });

    const numericSessionId = session.id;

    // 2. Fetch attendances and students
    let students: any[] = [];
    let attendances: any[] = [];

    attendances = await prisma.attendance.findMany({
      where: { session_id: numericSessionId },
      include: { student: true },
      orderBy: [{ date: 'asc' }],
    });

    console.log(`Found ${attendances.length} attendance records.`);

    // Filter out null student objects and deduplicate students safely
    const uniqueStudentsMap = new Map();
    attendances.forEach((a) => {
      if (a.student) {
        uniqueStudentsMap.set(a.student.id, a.student);
      } else {
        console.warn('Warning: attendance record without student:', a.id);
      }
    });
    students = Array.from(uniqueStudentsMap.values());

    console.log(`Deduplicated to ${students.length} unique student records.`);

    const attendanceMap = new Map(attendances.map((att) => [att.student_id, att]));

    // 3. Build excel workbook
    const ExcelJS = await import('exceljs');
    const ExcelJSModule = (ExcelJS.default || ExcelJS) as any;
    const workbook = new ExcelJSModule.Workbook();
    const sheet = workbook.addWorksheet('Danh Sách Điểm Danh');

    sheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'MSSV', key: 'student_code', width: 15 },
      { header: 'Họ và tên', key: 'name', width: 25 },
      { header: 'Lớp', key: 'class_id', width: 15 },
      { header: 'Trạng thái', key: 'status', width: 20 },
      { header: 'Thời gian quét', key: 'time', width: 25 },
      { header: 'IP Address', key: 'ipAddress', width: 15 },
      { header: 'Xác minh vị trí', key: 'verifiedLocation', width: 20 },
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' },
    };

    students.forEach((student, index) => {
      const attendance = attendanceMap.get(student.id);
      sheet.addRow({
        stt: index + 1,
        student_code: student.student_code || 'N/A',
        name: student.name || 'N/A',
        class_id: student.class_id || 'N/A',
        status: attendance ? 'Đã điểm danh' : 'Chưa điểm danh',
        time: (attendance && attendance.date) ? new Date(attendance.date).toLocaleString('vi-VN') : '--',
        ipAddress: attendance ? (attendance.ipAddress === 'manual' ? 'Thủ công' : attendance.ipAddress || 'N/A') : '--',
        verifiedLocation: attendance
          ? attendance.verifiedLocation
            ? 'Hợp lệ'
            : 'Không hợp lệ'
          : '--',
      });
    });

    console.log('Writing to test_export.xlsx...');
    const buffer = await workbook.xlsx.writeBuffer();
    fs.writeFileSync('test_export.xlsx', Buffer.from(buffer));
    console.log(`SUCCESS! Saved test Excel file to: test_export.xlsx (${buffer.byteLength} bytes)`);

  } catch (error) {
    console.error('CRITICAL ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testExcel();
