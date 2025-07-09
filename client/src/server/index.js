import { createServer, Model, Factory, hasMany, belongsTo } from "miragejs";
import {
  TodoFactory,
  ContactFactory,
  ChatFactory,
  profileFactory,
  MessageFactory,
} from "./app/factory";
import { profileUser, contacts, chats, calendarEvents } from "./app/data";
import todoServerConfig from "./app/todoServer";
import boardServerConfig from "./app/boardServer";
import authServerConfig from "./auth/authServer";
import contactServerConfig from "./app/chatServer";
import calendarServerConfig from "./app/calendar";
import { faker } from "@faker-js/faker";
const previousDay = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
const dayBeforePreviousDay = new Date(
  new Date().getTime() - 24 * 60 * 60 * 1000 * 2
);

createServer({
  models: {
    todo: Model,
    user: Model,
    board: Model.extend({
      tasks: hasMany(),
    }),
    task: Model.extend({
      board: belongsTo(),
    }),
    profileUser: Model,
    contact: Model,
    chat: Model,
    calendarEvent: Model,
  },
  factories: {
    todo: TodoFactory,
  },

  seeds(server) {
    const backlog = server.create("board", {
      title: "Backlog",
      id: faker.string.uuid(),
    });
    const inProgress = server.create("board", {
      title: "In Progress",
      id: faker.string.uuid(),
    });
    const done = server.create("board", {
      title: "Done",
      id: faker.string.uuid(),
    });

    server.create("task", {
      title:
        " Meeting with UI/UX Team to manage our upcoming projects &amp; task.",
      date: faker.date.anytime(),
      priority: "high",
      assign: [
        {
          image: faker.image.avatar(),
          label: faker.person.firstName(),
          value: faker.internet.userName(),
        },
        {
          image: faker.image.avatar(),
          label: faker.person.firstName(),
          value: faker.internet.userName(),
        },
        {
          image: faker.image.avatar(),
          label: faker.person.firstName(),
          value: faker.internet.userName(),
        },
      ],
      startDate: faker.date.between({
        from: "2023-01-01T00:00:00.000Z",
        to: "2023-03-01T00:00:00.000Z",
      }),
      endDate: faker.date.between({
        from: "2023-01-01T00:00:00.000Z",
        to: "2023-03-01T00:00:00.000Z",
      }),
      boardId: backlog.id,
    });

    server.create("task", {
      title: " Meeting with  Team to manage Employee",
      date: faker.date.anytime(),
      priority: "medium",
      assign: [
        {
          image: faker.image.avatar(),
          label: faker.person.firstName(),
          value: faker.internet.userName(),
        },
        {
          image: faker.image.avatar(),
          label: faker.person.firstName(),
          value: faker.internet.userName(),
        },
      ],
      startDate: faker.date.between({
        from: "2023-01-01T00:00:00.000Z",
        to: "2023-03-01T00:00:00.000Z",
      }),
      endDate: faker.date.between({
        from: "2023-01-01T00:00:00.000Z",
        to: "2023-03-01T00:00:00.000Z",
      }),
      boardId: inProgress.id,
    });
    server.create("task", {
      title: "Meet with CTO",
      date: faker.date.anytime(),
      priority: "low",
      assign: [
        {
          image: faker.image.avatar(),
          label: faker.person.firstName(),
          value: faker.internet.userName(),
        },
        {
          image: faker.image.avatar(),
          label: faker.person.firstName(),
          value: faker.internet.userName(),
        },
        {
          image: faker.image.avatar(),
          label: faker.person.firstName(),
          value: faker.internet.userName(),
        },
      ],
      startDate: faker.date.between({
        from: "2023-01-01T00:00:00.000Z",
        to: "2023-03-01T00:00:00.000Z",
      }),
      endDate: faker.date.between({
        from: "2023-01-01T00:00:00.000Z",
        to: "2023-03-01T00:00:00.000Z",
      }),
      boardId: done.id,
    });
    server.createList("todo", 20);

    server.create("user", {
      email: "DashSpace@gmail.com",
      password: "DashSpace",
    });
    server.create("profileUser", { ...profileUser });
    contacts.forEach((contact) => {
      server.create("contact", {
        id: contact.id,
        fullName: contact.fullName,
        role: contact.role,
        about: contact.about,
        avatar: contact.avatar,
        status: contact.status,
      });
    });

    chats.forEach((chat) => {
      server.create("chat", {
        id: chat.id,
        userId: chat.userId,
        unseenMsgs: chat.unseenMsgs,
        chat: chat.chat,
      });
    });
    calendarEvents.forEach((element) => {
      server.create("calendarEvent", {
        id: faker.string.uuid(),
        title: element.title,
        start: element.start,
        end: element.end,
        allDay: element.allDay,
        //className: "warning",
        extendedProps: {
          calendar: element.extendedProps.calendar,
        },
      });
    });
  },
  routes() {
    this.namespace = "api";

    // this.get("/tickets", () => {
    //   return [
    //     {
    //       ticket_id: 1,
    //       created_at: "2025-07-02 14:41:47",
    //       customer_phone: "252612300001",
    //       communication_channel: "Phone",
    //       device_type: "Mobile",
    //       issue_type: "Login",
    //       issue_description: "User cannot log in",
    //       agent_id: 3,
    //       resolution_status: "Resolved",
    //       end_time: "2025-07-02 16:41:47"
    //     },
    //     {
    //       ticket_id: 2,
    //       created_at: "2025-07-02 14:41:47",
    //       customer_phone: "252612300002",
    //       communication_channel: "Email",
    //       device_type: "Laptop",
    //       issue_type: "Payment",
    //       issue_description: "Payment not processed",
    //       agent_id: 3,
    //       resolution_status: "In Progress",
    //       end_time: null
    //     },
    //     {
    //       ticket_id: 3,
    //       created_at: "2025-07-02 11:42:30",
    //       customer_phone: "0612000029",
    //       communication_channel: "Phone",
    //       device_type: "Laptop",
    //       issue_type: "Billing",
    //       issue_description: "cabasho IPTV",
    //       agent_id: 2,
    //       resolution_status: "done",
    //       end_time: "2025-07-02 11:42:54"
    //     },
    //     {
    //       ticket_id: 4,
    //       created_at: "2025-07-02 11:46:23",
    //       customer_phone: "12131242",
    //       communication_channel: "Phone",
    //       device_type: "Laptop",
    //       issue_type: "Billing",
    //       issue_description: "cabasho",
    //       agent_id: 2,
    //       resolution_status: "done",
    //       end_time: "2025-07-02 11:47:03"
    //     }
    //   ];
    // });

    todoServerConfig(this);
    boardServerConfig(this);
    authServerConfig(this);
    contactServerConfig(this);
    calendarServerConfig(this);
    this.timing = 500;
    
    // Passthrough for real backend API calls
    this.passthrough('http://localhost:3000/**');
    this.passthrough('http://127.0.0.1:3000/**');
  },
});
