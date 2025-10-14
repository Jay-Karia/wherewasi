import "../../public/logo.png";

export default function Logo() {
  return (
    <div className="transition-all duration-200 hover:opacity-70 hover:rotate-12">
      <img src="../../public/logo.png" height={30} width={30} alt="Logo" />
    </div>
  );
}
