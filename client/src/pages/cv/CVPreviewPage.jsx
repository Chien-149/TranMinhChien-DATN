import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Button } from 'antd';
import { ArrowLeft, Download } from 'lucide-react';
import useCVApi from './hooks/useCVApi';
import CVPreview from './CVPreview';

export default function CVPreviewPage() {
    const { cvId } = useParams();
    const navigate = useNavigate();
    const { currentCV, loading, fetchCVById, exportPDF } = useCVApi();

    useEffect(() => {
        if (cvId) {
            fetchCVById(cvId);
        }
    }, [cvId, fetchCVById]);

    const handleExportPDF = async () => {
        if (!currentCV) return;
        const filename = `cv-${currentCV.profile?.fullName?.replace(/\s+/g, '-') || currentCV.name}.pdf`;
        await exportPDF(currentCV._id, currentCV.template, filename);
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center">
            {/* Minimal Header */}
            <header className="w-full bg-white shadow-sm h-16 flex flex-row items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Button 
                        type="text" 
                        icon={<ArrowLeft size={18} />} 
                        onClick={() => navigate('/my-cvs')} 
                        className="text-slate-500 hover:text-slate-800"
                    />
                    <h1 className="text-lg font-bold text-slate-800">
                        Xem trước CV: <span className="text-sky-600 font-semibold">{currentCV?.name}</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        type="primary" 
                        icon={<Download size={16} />} 
                        onClick={handleExportPDF}
                        disabled={!currentCV}
                        className="bg-indigo-600 border-none hover:bg-indigo-700"
                    >
                        Tải PDF xuống
                    </Button>
                </div>
            </header>

            {/* Preview Container */}
            <main className="flex-1 w-full max-w-4xl py-10 px-4 flex justify-center">
                {loading || !currentCV ? (
                    <div className="flex items-center justify-center mt-20">
                        <Spin size="large" tip="Đang tải CV..." />
                    </div>
                ) : (
                    <div className="w-[800px] shadow-2xl bg-white overflow-hidden" style={{ minHeight: '1131px' }}>
                        <CVPreview cv={currentCV} />
                    </div>
                )}
            </main>
        </div>
    );
}
