import InventtoIcon from '@/assets/icon.svg';

export const Logo = () => {
  return (
    <figure className="relative flex gap-1 items-center">
      <img
        src={InventtoIcon}
        alt="Inventto Logo"
        className="absolute top-[-8px]"
      ></img>
      <figcaption className="pl-10 text-green-950 text-[32px] font-bold leading-none font-philosopher">
        Inventto
      </figcaption>
    </figure>
  );
};
