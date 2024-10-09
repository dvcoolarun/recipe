import { QueryClient, QueryClientProvider, useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { Zodios, makeApi } from "@zodios/core"
import { z } from "zod";

const userSchema = z
  .object({
    id: z.number(),
    name: z.string(),
  })
  .required();

const createUserSchema = z
  .object({
    name: z.string(),
  })
  .required();

const usersSchema = z.array(userSchema);

type User = z.infer<typeof userSchema>;
type Users = z.infer<typeof usersSchema>;

const api = makeApi([
  {
    method: "get",
    path: "/users",
    alias: "getUsers",
    description: "Get all users",
    response: usersSchema,
  },
  {
    method: "get",
    path: "/users/:id",
    alias: "getUserById",
    description: "Get a user",
    response: userSchema,
  },
  {
    method: "post",
    path: "/users",
    alias: "createUser",
    description: "Create a user",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: createUserSchema,
      },
    ],
    response: userSchema,
  },
]);
const baseUrl = "https://jsonplaceholder.typicode.com";
const apiClient = new Zodios(baseUrl, api);


const queryClient = new QueryClient({
});

const useGetUsers = (): UseQueryResult<User[], Error> => {
  return useQuery({
    queryKey: ["getUsers"],
    queryFn: async () => {
      return await apiClient.getUsers();
    },
  })
};

const useCreateUser = () => {
  return useMutation({
    mutationFn: async (user: { name: string }) => {
      return await apiClient.createUser(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getUsers"] });
    }
  });
};

const Users = () => {
  const { data: users, status } = useGetUsers();
  const { mutate } = useCreateUser();

  return (
    <>
      <h1>Users</h1>
      <button onClick={() => mutate({ name: "john doe" })}>add user</button>
      {status === "pending" && <div>Loading...</div>}
      {status === "error" && <div>Error fetching users</div>}
      {status === "success" && (
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )
      }
    </>
  );
};


function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <Users />
    </QueryClientProvider>
  );
}

export default App;