import React, { useState, useEffect } from 'react';

interface ContextMenuProps {}

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [contextType, setContextType] = useState<'canvas' | 'node'>('canvas');

  const canvasMenuItems: MenuItem[] = [
    {
      id: 'create-sticky-note',
      label: 'Create Sticky Note',
      icon: '📝',
      action: () => {
        console.log('Creating sticky note at', position);
        setIsVisible(false);
      },
    },
    {
      id: 'create-text-file',
      label: 'Create Text File',
      icon: '📄',
      action: () => {
        console.log('Creating text file at', position);
        setIsVisible(false);
      },
    },
    {
      id: 'create-shape',
      label: 'Create Shape',
      icon: '🔷',
      action: () => {
        console.log('Creating shape at', position);
        setIsVisible(false);
      },
    },
    {
      id: 'paste',
      label: 'Paste',
      icon: '📋',
      action: () => {
        console.log('Pasting at', position);
        setIsVisible(false);
      },
      disabled: true, // TODO: Enable when clipboard functionality is implemented
    },
  ];

  const nodeMenuItems: MenuItem[] = [
    {
      id: 'copy',
      label: 'Copy',
      icon: '📋',
      action: () => {
        console.log('Copying node');
        setIsVisible(false);
      },
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: '📑',
      action: () => {
        console.log('Duplicating node');
        setIsVisible(false);
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: '🗑️',
      action: () => {
        console.log('Deleting node');
        setIsVisible(false);
      },
    },
    {
      id: 'properties',
      label: 'Properties',
      icon: '⚙️',
      action: () => {
        console.log('Opening properties');
        setIsVisible(false);
      },
    },
  ];

  const menuItems = contextType === 'canvas' ? canvasMenuItems : nodeMenuItems;

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setPosition({ x: e.clientX, y: e.clientY });
      setContextType('canvas'); // TODO: Determine if right-clicking on node or canvas
      setIsVisible(true);
    };

    const handleClick = () => {
      setIsVisible(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisible(false);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-2 z-50 min-w-48"
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(${position.x + 200 > window.innerWidth ? '-100%' : '0'}, ${
          position.y + 300 > window.innerHeight ? '-100%' : '0'
        })`,
      }}
    >
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={item.action}
          disabled={item.disabled}
          className={`w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center space-x-3 ${
            item.disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span className="text-lg">{item.icon}</span>
          <span className="text-white">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ContextMenu; 