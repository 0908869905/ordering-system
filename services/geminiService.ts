// Replaced with static content service to remove AI dependency
const WELCOME_SLOGAN = "哇塞！超熱騰騰香噴噴的炒麵香腸來囉！快來吃爆它！";

export const generateWelcomeMessage = async (): Promise<string> => {
  return Promise.resolve(WELCOME_SLOGAN);
};

export const generateOrderReceiptNote = async (items: string[]): Promise<string> => {
  return Promise.resolve("美味即將上桌！");
};