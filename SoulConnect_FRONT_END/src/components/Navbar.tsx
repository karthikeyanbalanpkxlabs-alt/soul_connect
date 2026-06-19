const Navbar = () => {
  return (
    <nav>
      <a href="#" className="nav-logo">
        Soul<span>Connect</span>
        <div className="logo-dot"></div>
      </a>
      <div className="nav-links" id="navLinks">
        <a href="#districts">Districts</a>
        <a href="#how">How it works</a>
        <a href="#register">Register</a>
        <a href="#pricing">Plans</a>
        <a href="#verify">Verification</a>
        <a href="#app">App</a>

        <a href="#register" className="nav-tamil">
          பதிவு செய்யுங்கள்
        </a>
        <a
          href="#app"
          onClick={() => {
            window.location.href = window.location.origin + "/portal";
          }}
        >
          Login
        </a>
        <a href="#register" className="btn-nav">
          Begin Journey ✦
        </a>
      </div>
      <div className="hamburger" id="hamburger" onClick="toggleNav()">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
};
export { Navbar };
export default Navbar;
