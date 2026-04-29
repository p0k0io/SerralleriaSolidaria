import { useState } from 'react';
import ShowPacks from '../../components/packs/showPacks'
import CreatePack from '../../components/packs/createPacks'

export default function Packs(){
  const [refreshPacks, setRefreshPacks] = useState(false);

    return(        
        <div className="p-6 space-y-6">   
            <h1 className="text-2xl font-semibold text-slate-800">Packs</h1>

            <CreatePack onCreated={() => setRefreshPacks((prev) => !prev)} />
            <ShowPacks refreshSignal={refreshPacks} />
        </div>
    );
    
}