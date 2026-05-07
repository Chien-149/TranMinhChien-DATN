import React from 'react';
import { Card, Tooltip } from 'antd';
import { Check, Palette } from 'lucide-react';
import { getTemplateList } from '../templates';

export default function TemplateSelector({ selected, onSelect }) {
    const templates = getTemplateList();

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
                <Palette size={16} className="text-sky-600" />
                <span>Chọn Mẫu CV</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {templates.map((template) => (
                    <Tooltip key={template.id} title={template.description}>
                        <Card
                            hoverable
                            className={`cursor-pointer transition-all ${
                                selected === template.id ? 'ring-2 ring-sky-500 ring-offset-2' : 'hover:border-sky-300'
                            }`}
                            bodyStyle={{ padding: '12px' }}
                            onClick={() => onSelect(template.id)}
                        >
                            <div className="relative">
                                {/* Template Preview Color Bar */}
                                <div
                                    className="h-16 rounded-lg mb-2"
                                    style={{
                                        background: `linear-gradient(135deg, ${template.primaryColor} 0%, ${template.primaryColor}99 100%)`,
                                    }}
                                />

                                {/* Selected indicator */}
                                {selected === template.id && (
                                    <div className="absolute top-1 right-1 w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                                        <Check size={12} className="text-white" />
                                    </div>
                                )}
                            </div>
                            <p className="text-center text-sm font-medium text-gray-700">{template.name}</p>
                        </Card>
                    </Tooltip>
                ))}
            </div>
        </div>
    );
}
