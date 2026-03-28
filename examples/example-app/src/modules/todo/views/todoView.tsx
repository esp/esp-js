import React from 'react';
import {usePublishStoreEvent} from 'esp-js-react';
import { TodoEvents } from '../stores/todoEvents';
import { FilterMode } from '../stores/todoModel.ts';
import { TodoItem } from './todoItem';
import {TodoModel} from '../stores/todoModel.ts';

interface TodoViewProps {
    model: TodoModel;
}

const FILTER_LABELS: Record<FilterMode, string> = {
    all: 'All',
    active: 'Active',
    completed: 'Completed',
};

export const TodoView = ({ model }: TodoViewProps) => {
    const publishStoreEvent = usePublishStoreEvent();

    const publish = (eventType: string, event: any) => publishStoreEvent(eventType, event);

    const filteredItems = model.items.filter(item => {
        if (model.filter === 'active') return !item.completed;
        if (model.filter === 'completed') return item.completed;
        return true;
    });

    const activeCount = model.items.filter(i => !i.completed).length;
    const completedCount = model.items.filter(i => i.completed).length;
    const hasCompleted = completedCount > 0;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            publish(TodoEvents.AddTodo, {});
        }
    };

    return (
        <div style={{
            maxWidth: '540px',
            margin: '40px auto',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
            <h1 style={{
                textAlign: 'center',
                fontSize: '48px',
                fontWeight: 100,
                color: '#b83f45',
                marginBottom: '24px',
            }}>
                todos
            </h1>

            {/* Input row */}
            <div style={{
                display: 'flex',
                background: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                marginBottom: '0',
            }}>
                <input
                    type="text"
                    value={model.newItemText}
                    onChange={e => publish(TodoEvents.UpdateNewItemText, { text: e.target.value })}
                    onKeyDown={handleKeyDown}
                    placeholder="What needs to be done?"
                    style={{
                        flex: 1,
                        padding: '16px 16px 16px 60px',
                        fontSize: '24px',
                        fontWeight: 300,
                        border: 'none',
                        outline: 'none',
                        color: '#333',
                    }}
                />
                <button
                    onClick={() => publish(TodoEvents.AddTodo, {})}
                    disabled={!model.newItemText.trim()}
                    style={{
                        padding: '0 20px',
                        background: '#5ba4cf',
                        color: '#fff',
                        border: 'none',
                        cursor: model.newItemText.trim() ? 'pointer' : 'default',
                        fontSize: '14px',
                        opacity: model.newItemText.trim() ? 1 : 0.5,
                    }}
                >
                    Add
                </button>
            </div>

            {/* Todo list */}
            {model.items.length > 0 && (
                <div style={{
                    background: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}>
                    <ul style={{ listStyle: 'none', margin: 0, padding: '0 16px' }}>
                        {filteredItems.map(item => (
                            <TodoItem
                                key={item.id}
                                item={item}
                                publishEvent={publish}
                            />
                        ))}
                        {filteredItems.length === 0 && (
                            <li style={{ padding: '16px 0', color: '#aaa', textAlign: 'center' }}>
                                No {model.filter} tasks.
                            </li>
                        )}
                    </ul>

                    {/* Footer */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 16px',
                        borderTop: '1px solid #eee',
                        fontSize: '13px',
                        color: '#777',
                    }}>
                        <span>
                            {activeCount} {activeCount === 1 ? 'item' : 'items'} left
                        </span>

                        {/* Filter buttons */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {(['all', 'active', 'completed'] as FilterMode[]).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => publish(TodoEvents.SetFilter, { filter: mode })}
                                    style={{
                                        padding: '2px 8px',
                                        border: model.filter === mode ? '1px solid #5ba4cf' : '1px solid transparent',
                                        borderRadius: '3px',
                                        background: 'none',
                                        cursor: 'pointer',
                                        color: model.filter === mode ? '#5ba4cf' : '#777',
                                    }}
                                >
                                    {FILTER_LABELS[mode]}
                                </button>
                            ))}
                        </div>

                        {hasCompleted && (
                            <button
                                onClick={() => publish(TodoEvents.ClearCompleted, {})}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#777',
                                    fontSize: '13px',
                                }}
                            >
                                Clear completed
                            </button>
                        )}
                    </div>
                </div>
            )}

            {model.items.length === 0 && (
                <p style={{ textAlign: 'center', color: '#aaa', marginTop: '24px' }}>
                    No todos yet — add one above!
                </p>
            )}
        </div>
    );
}
