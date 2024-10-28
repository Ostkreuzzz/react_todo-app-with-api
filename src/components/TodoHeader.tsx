import { useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { USER_ID } from '../api/todos';

import { ErrorMessages } from '../types/ErrorTypes';
import { Todo } from '../types/Todo';

import { handleError } from '../utils/handleError';

interface Props {
  onTempTodo: (todo: Todo | null) => void;
  onErrorMessage: (type: ErrorMessages) => void;
  onAdd: (todo: Todo) => Promise<void>;
  onUpdate: (todos: Todo) => Promise<void>;
  todos: Todo[];
}

export const TodoHeader: React.FC<Props> = ({
  todos,
  onAdd,
  onUpdate,
  onErrorMessage,
  onTempTodo,
}) => {
  const [title, setTitle] = useState('');
  const [isSubmiting, setIsSubmiting] = useState(false);

  const isAllCompleted =
    todos.every(todo => todo.completed) && todos.length !== 0;

  const todoInput = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmiting(true);

    if (!title) {
      handleError(onErrorMessage, ErrorMessages.EMPTY_TITLE);
      setIsSubmiting(false);

      return;
    }

    const tempTodo = {
      id: 0,
      userId: USER_ID,
      title: title.trim(),
      completed: false,
    };

    onTempTodo(tempTodo);
    onErrorMessage(ErrorMessages.NONE);

    onAdd(tempTodo)
      .then(() => {
        setTitle('');
      })
      .catch(() => {
        handleError(onErrorMessage, ErrorMessages.ADD_FAIL);
        onTempTodo(null);
      })
      .finally(() => {
        onTempTodo(null);
        setIsSubmiting(false);
      });
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value.trimStart());
    onErrorMessage(ErrorMessages.NONE);
  };

  const handleToggle = () => {
    if (isAllCompleted) {
      todos.map(todo => onUpdate({ ...todo, completed: false }));
    } else {
      todos
        .filter(todo => !todo.completed)
        .map(todo => onUpdate({ ...todo, completed: true }));
    }
  };

  useEffect(() => {
    todoInput.current?.focus();
  }, [title, isSubmiting, todos.length]);

  return (
    <header className="todoapp__header">
      {!!todos.length && (
        <button
          type="button"
          className={cn('todoapp__toggle-all ', { active: isAllCompleted })}
          data-cy="ToggleAllButton"
          onClick={handleToggle}
        />
      )}

      <form onSubmit={handleSubmit}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={title}
          onChange={handleInput}
          autoFocus
          disabled={isSubmiting}
          ref={todoInput}
        />
      </form>
    </header>
  );
};
