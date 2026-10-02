import Workspace from './workspace';
import {getChatGPTUser,chatGPTSignInPath} from './chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Home(){const user=await getChatGPTUser();return <Workspace user={user?{id:user.userId,name:user.displayName}:null} signInPath={chatGPTSignInPath('/')}/>}
