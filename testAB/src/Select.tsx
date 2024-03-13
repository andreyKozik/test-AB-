//P.S. Оставляю некоторые коментарии так как время ограничено а предела совершенству нет

import React, { useState, useEffect, useRef } from "react";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  job?: string;
}

interface Response {
  data: Array<User>;
  meta: {
    from: number;
    to: number;
    total: number;
  };
}

// это можно использовать для того что бы переиспользовать компонент селект и передавать ему различные массивы данных а не быть завязанным только на этих данных
// interface SelectProps {
//   options: User[];
// эта функция как раз будет и нужна что бы взаимодействовать с выбранным элементом в родительсом компоненте
//   onSelect: (value: string) => void;
// }

const Select: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<User | null>(null);

  const containerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    containerRef.current &&
      containerRef.current.addEventListener("scroll", handleScroll);
    return () => {
      containerRef.current &&
        containerRef.current.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // по хорошему нужно вынести в свой хук что бы можно было переиспользовать
  const loadMoreUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://alanbase.vercel.app/api/users?page=${page}&limit=50`
      );
      const data: Response = await response.json();
      setUsers((prevUsers) => [...prevUsers, ...data.data]);
      setPage((prevpage) => prevpage + 1);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  // тут конечно можно поиграться и запрашивать данные раньше немного но оставил так что бы можно было видеть индикатор загрузки и плюс по хорошему сюда бы я доокинул какой нибудь дебаунс для избежания проблем и багов
  const handleScroll = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      if (
        container.scrollTop + container.clientHeight ===
        container.scrollHeight
      ) {
        loadMoreUsers();
      }
    }
  };

  const handleOptionClick = (option: User) => {
    setSelectedOption(option);
    // описал выше зачем эта функция
    // onSelect(option.value);
    setIsOpen(false);
  };

  const openSelect = () => {
    users.length === 0 && loadMoreUsers();
    setIsOpen(!isOpen);
  };

  const createOption = (option: User) => {
    return (
      <span>{`${option.last_name} ${option.first_name}, ${option.job}`}</span>
    );
  };

  const createStubIcon = (lastName: string) => {
    return <div className="stubIcon">{lastName.charAt(0).toUpperCase()}</div>;
  };

  return (
    <div className="custom-select">
      <div
        className={`selected-option ${isOpen && "select-open"}`}
        onClick={openSelect}
      >
        {selectedOption ? createOption(selectedOption) : "Select an option"}
      </div>
      {isOpen && (
        <ul className="options" onScroll={handleScroll} ref={containerRef}>
          {users.map((user) => (
            <li
              className="option"
              key={page + "-" + user.id}
              onClick={() => handleOptionClick(user)}
            >
              {createStubIcon(user.last_name)}
              {createOption(user)}
            </li>
          ))}
          {loading && <li>Loading...</li>}
        </ul>
      )}
    </div>
  );
};

export default Select;
