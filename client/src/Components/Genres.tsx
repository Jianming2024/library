import {useAtom} from "jotai";
import {allGenresAtom} from "../atoms.ts";

export default function Genres() {
    const [genres] = useAtom(allGenresAtom);
    return <>{
        genres.map(g => {
            return <div key={g.id}>{JSON.stringify(g)}</div>
        })
    }</>
}