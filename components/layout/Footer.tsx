import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-12 mt-auto">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
        <div>© {new Date().getFullYear()} MyApp. All rights reserved.</div>
        <div className="flex gap-6">
          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Chính sách bảo mật
          </Link>
          <Link
            href="/terms"
            className="hover:text-foreground transition-colors"
          >
            Điều khoản dịch vụ
          </Link>
          <Link
            href="/contact"
            className="hover:text-foreground transition-colors"
          >
            Liên hệ
          </Link>
        </div>
      </div>
    </footer>
  );
}
