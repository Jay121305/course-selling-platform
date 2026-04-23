const Footer = () => {
  return (
    <footer className="footer">
      <p>
        © {new Date().getFullYear()} <strong>EduLaunch</strong> — Course Selling Platform.
        Built with React, Node.js & MongoDB.
      </p>
    </footer>
  );
};

export default Footer;
