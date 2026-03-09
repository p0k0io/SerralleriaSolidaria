import { useState } from "react"


export default function Register(){
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] =useState("")
    const [address , setAddress] = useState("")


     const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ name, email, password, confirmPassword, address })
  }
    return(

        <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8">
        
        <h2 className="text-3xl font-bold text-center mb-6">
          Registro
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

            <div >
                <label className="block text-sm mb-1">Nombre completo</label>
                <input 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                type="text"
                name="name"
                placeholder="Lucas Sanchez Alava"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                 />
            </div>
          
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="ejemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

           <div >
                <label className="block text-sm mb-1">Direccion completa</label>
                <input 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                type="text"
                name="address"
                id="address"
                placeholder="Calle Alfonso XII, 23 2-8"
                value={name}
                onChange={(e) => setAddress(e.target.value)}
                 />
          </div>

          <div>
            <label className="block text-sm mb-1">Contraseña</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>


          <div>
            <label className="block text-sm mb-1">Repite Contraseña</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="********"
              value={password}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div>
            <a className="font-light text-sm" href="/login"> Ya tienes una cuenta?</a>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-700 font-bold text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
    )
}