import { User } from "@/state/api";
import React from "react";

type Props = {
  user: User;
};

const UserCard = ({ user }: Props) => {
  return (
    <div className="flex items-center rounded border p-4 shadow">
      <div className="mr-4 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
        <span className="text-white text-sm font-bold">
          {user.username.charAt(0).toUpperCase()}
        </span>
      </div>
      <div>
        <h3>{user.username}</h3>
        <p>{user.email}</p>
      </div>
    </div>
  );
};

export default UserCard;