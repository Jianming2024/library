import {useAtom} from "jotai";
import {allAuthorsAtom} from "../atoms.ts";

export default function Authors() {
    const [authors] = useAtom(allAuthorsAtom)
    return <>{
        authors.map(a => {
            return <div key={a.id}>{JSON.stringify(a)}</div>
        })
    }</>
}