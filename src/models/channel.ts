import { ChatDetails } from "./chat"
import { UserDetails } from "./user"

export interface ChannelDetails{
    id: number
    user?: UserDetails
    friend?: UserDetails
    organization?: string
    chats: ChatDetails[]
}