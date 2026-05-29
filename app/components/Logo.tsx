import Link from 'next/link'

export const Logo = () => {
  return (
    <Link href={"/"} className='flex items-center gap-2 group'>
      {/* Logo Icon */}
      <div className='relative w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 via-pink-300 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-400/50 group-hover:shadow-pink-500/70 transition-all duration-300 group-hover:scale-110'>
        <div className='text-white font-bold text-lg drop-shadow-md'>🍳</div>
      </div>
      
      {/* Logo Text */}
      <div className='flex flex-col'>
        <span className='text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 font-bold text-xl tracking-tight group-hover:from-pink-300 group-hover:to-rose-300 transition-all duration-300'>
          Besh
        </span>
        <span className='text-xs font-semibold text-gray-400 group-hover:text-pink-300 transition-colors duration-300 -mt-1'>
          Recipes
        </span>
      </div>
    </Link>
  );
};

export default Logo;
