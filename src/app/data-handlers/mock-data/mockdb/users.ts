import { User } from "src/app/models/user";

export const users: User[] = [
    {
        id: 1,
        firstName: "Alfonzo",
        lastName: "Henández",
        active: true,
        email:"ahernandez@mock.com",    
        phone: "12345678",
        gender: "Male",
        title: "Sr."
    },
    {
        id: 2,
        firstName: "Matías",
        lastName: "Sosa",
        active: false,
        email:"msosa@mock.com",    
        phone: "12345678",
        gender: "Male",
        title: "Sr."
    },
    {
        id: 3,
        firstName: "Christian",
        lastName: "Pérez",
        active: true,
        email:"cpérez@mock.com",    
        phone: "12345678",
        gender: "Male",
        title: "Sr."
    }
]