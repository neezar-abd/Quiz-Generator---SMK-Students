import React from 'react';

interface JsonViewProps {
  data: unknown;
  title?: string;
  className?: string;
}

export default function JsonView({ data, title, className = '' }: JsonViewProps) {
  const formatJson = (obj: unknown, indent = 0): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    const spacing = '  '.repeat(indent);

    if (Array.isArray(obj)) {
      result.push(
        <span key="array-start" className="text-black/60">{'['}</span>
      );
      obj.forEach((item, index) => {
        result.push(<br key={`br-${index}`} />);
        result.push(
          <span key={`item-${index}`}>
            {spacing}  {formatJson(item, indent + 1)}
            {index < obj.length - 1 && <span className="text-black/60">,</span>}
          </span>
        );
      });
      if (obj.length > 0) {
        result.push(<br key="array-br" />);
        result.push(<span key="array-spacing">{spacing}</span>);
      }
      result.push(
        <span key="array-end" className="text-black/60">{']'}</span>
      );
    } else if (obj && typeof obj === 'object') {
      result.push(
        <span key="obj-start" className="text-black/60">{'{'}</span>
      );
      const entries = Object.entries(obj);
      entries.forEach(([key, value], index) => {
        result.push(<br key={`br-${key}`} />);
        result.push(
          <span key={`entry-${key}`}>
            {spacing}  <span className="text-blue-600 font-medium">&quot;{key}&quot;</span>
            <span className="text-black/60">: </span>
            {formatJson(value, indent + 1)}
            {index < entries.length - 1 && <span className="text-black/60">,</span>}
          </span>
        );
      });
      if (entries.length > 0) {
        result.push(<br key="obj-br" />);
        result.push(<span key="obj-spacing">{spacing}</span>);
      }
      result.push(
        <span key="obj-end" className="text-black/60">{'}'}</span>
      );
    } else if (typeof obj === 'string') {
      result.push(
        <span key="string" className="text-green-600">
          &quot;{obj}&quot;
        </span>
      );
    } else if (typeof obj === 'number') {
      result.push(
        <span key="number" className="text-purple-600">
          {obj}
        </span>
      );
    } else if (typeof obj === 'boolean') {
      result.push(
        <span key="boolean" className="text-red-600">
          {obj ? 'true' : 'false'}
        </span>
      );
    } else if (obj === null) {
      result.push(
        <span key="null" className="text-gray-500">
          null
        </span>
      );
    } else {
      result.push(
        <span key="other" className="text-gray-600">
          {String(obj)}
        </span>
      );
    }

    return result;
  };

  return (
    <div className={`bg-white border-2 border-black p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-bold mb-2 text-black">{title}</h3>
      )}
      <div className="font-mono text-sm overflow-x-auto">
        <code className="text-black">
          {formatJson(data)}
        </code>
      </div>
    </div>
  );
}