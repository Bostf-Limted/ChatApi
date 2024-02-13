import { ChatDetails } from "./chat"
import { UserDetails } from "./user"

export interface ChannelDetails{
    id: number
    userOne: UserDetails
    userTwo: UserDetails
    organization?: string
    chats: ChatDetails[]
}