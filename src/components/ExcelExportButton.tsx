import React, { useState } from 'react';
import { excelExportService } from '../services/excelExportService';

interface ExcelExportButtonProps {
  exportType: 'todos' | 'workorders' | 'equipment' | 'all';
  className?: string;
  children?: React.ReactNode;
}

const ExcelExportButton: React.FC<ExcelExportButtonProps> = ({ 
  exportType, 
  className = '', 
  children 
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      switch (exportType) {
        case 'todos':
          await excelExportService.exportTodos();
          break;
        case 'workorders':
          await excelExportService.exportWorkOrders();
          break;
        case 'equipment':
          await excelExportService.exportEquipment();
          break;
        case 'all':
          await excelExportService.exportAllData();
          break;
        default:
          throw new Error('지원하지 않는 내보내기 타입입니다.');
      }
      
      // 성공 메시지 (선택사항)
      console.log(`${exportType} 데이터가 성공적으로 내보내졌습니다.`);
    } catch (error) {
      console.error('Excel 내보내기 실패:', error);
      alert('Excel 내보내기 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  const getButtonText = () => {
    if (isExporting) return '내보내는 중...';
    
    switch (exportType) {
      case 'todos':
        return 'Todo Excel 내보내기';
      case 'workorders':
        return '작업지시서 Excel 내보내기';
      case 'equipment':
        return '설비 Excel 내보내기';
      case 'all':
        return '전체 데이터 Excel 내보내기';
      default:
        return 'Excel 내보내기';
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 ${className}`}
    >
      {isExporting ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          내보내는 중...
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {children || getButtonText()}
        </>
      )}
    </button>
  );
};

export default ExcelExportButton;
