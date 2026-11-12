import React from 'react';
import { TodoEvents } from '../stores/todoEvents';
import { TodoItem as TodoItemType } from '../stores/todoModel';

interface TodoItemProps {
    item: TodoItemType;
    publishEvent: (eventType: string, event: any) => void;
}

export const TodoItem = ({ item, publishEvent }: TodoItemProps) => {
    return (
        <li style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 0',
            borderBottom: '1px solid #eee',
        }}>
            <input
                type="checkbox"
                checked={item.completed}
                onChange={() => publishEvent(TodoEvents.ToggleTodo, { id: item.id })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{
                flex: 1,
                textDecoration: item.completed ? 'line-through' : 'none',
                color: item.completed ? '#aaa' : '#333',
                fontSize: '16px',
            }}>
                {item.text}
            </span>
            <button
                onClick={() => publishEvent(TodoEvents.DeleteTodo, { id: item.id })}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#cc4444',
                    fontSize: '18px',
                    padding: '0 4px',
                }}
                title="Delete"
            >
                ×
            </button>
        </li>
    );
}
