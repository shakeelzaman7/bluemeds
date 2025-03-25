import { Application } from "src/app/models/app";

let placeholderImage = () => {
    return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW3lzH45w9milEJzJv9h1ZlCiSYgtTM7j0Ng&usqp=CAU"
}

export const applications: Application[] = [  
    {
        id: 1,
        name: "Admin. de usuarios & roles",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ",
        img: placeholderImage(),
        url: "/admin/users",
        active: true
    },
    {
        id: 2,
        name: "Facturación",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ",
        img: placeholderImage(),
        active: true
    },
    {
        id: 3,
        name: "Entidades generales del sistema",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ",
        img: placeholderImage(),
        url: "/general-entities",
        active: true
    },
    {
        id: 4,
        name: "Planes",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ",
        img: placeholderImage(),
        active: true
    },
    {
        id: 5,
        name: "Reportes",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ",
        img: placeholderImage(),
        active: true
    },
    {
        id: 6,
        name: "Prestadores de servicio & especialidades",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ",
        img: placeholderImage(),
        active: true
    }
]