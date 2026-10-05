import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[70svh] max-w-[44rem] content-center px-5 pt-24 sm:px-8">
      <h1 className="tight text-4xl font-semibold">This page isn’t here.</h1>
      <p className="mt-4 text-lg text-mist">The link may be old, or the address mistyped.</p>
      <p className="mt-8 flex gap-6">
        <Link href="/en/" className="underline">Home (English)</Link>
        <Link href="/ar/" lang="ar" className="underline">الصفحة الرئيسية</Link>
      </p>
    </div>
  );
}
