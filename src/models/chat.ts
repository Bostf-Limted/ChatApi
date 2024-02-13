import { UserDetails } from "./user"

export interface ChatDetails {
    id: number
    message: string
    received : boolean
    createdAt : string
    updatedAt : string

    sender: UserDetails

    reply: ChatDetails[]
}

class Chat {
    
}

export default Chat;