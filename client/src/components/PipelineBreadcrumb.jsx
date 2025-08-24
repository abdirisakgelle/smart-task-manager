import React from 'react';

const steps = ['Idea','Script','Production','Social'];

export default function PipelineBreadcrumb({ current }){
  return (
    <div className="flex items-center gap-2 text-sm">
      {steps.map((step, idx) => (
        <React.Fragment key={step}>
          <span className={step === current ? 'font-semibold text-red-600' : 'text-gray-500'}>{step}</span>
          {idx < steps.length - 1 && <span className="text-gray-400">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
}