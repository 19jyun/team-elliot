const { setupServer } = require("msw/node");
const { handlers } = require("./handlers");

// MSW 서버 설정
export const server = setupServer(...handlers);
