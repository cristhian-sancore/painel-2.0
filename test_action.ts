import { fetchMessagesAction } from "./src/app/(dashboard)/chat/actions";
async function main() {
    const msgs = await fetchMessagesAction("http://172.28.0.10:3000", "i9Ch9WjTicBEyfBtiqqNukZS", 15);
    console.log(msgs[msgs.length - 1].attachments[0].data_url);
}
main();
