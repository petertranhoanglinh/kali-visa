export interface UserChatMessage {
    content: string;
    sender: string;
    groupId: string;
    mediaUrl: string;
    mediaType: string;
    timestamp: Date;
}
