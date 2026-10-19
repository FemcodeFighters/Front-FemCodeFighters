import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let client = null;

export function connectToRoom(roomId, onStateUpdate) {
    if (client?.active) disconnectFromRoom();

    client = new Client({
webSocketFactory: () => new SockJS("http://localhost:8080/ws-game"),        
reconnectDelay: 3000,
        onConnect: () => {
            client.subscribe(`/topic/game/${roomId}`, (message) => {
                onStateUpdate(JSON.parse(message.body));
            });
        },
    });

    client.activate();
}

export function sendInput(roomId, playerId, action, tick) {
    if (!client?.connected) {
        console.warn("sendInput: cliente no conectado, descartado", { roomId, playerId, action });
        return;
    }
    client.publish({
        destination: `/app/game/${roomId}/input`,
        body: JSON.stringify({ playerId, action, tick }),
    });
}


export function disconnectFromRoom() {
    client?.deactivate();
    client = null;
}