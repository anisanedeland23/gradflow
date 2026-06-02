    export default function Header() {
    return (

        <div className="rounded-2xl bg-white p-3 shadow-sm">

        <div className="flex items-center justify-between gap-4">

            {/* LEFT */}
            <div className="flex items-center gap-4">

            {/* Avatar */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-2xl">

                🧑🏻‍💻

            </div>

            {/* Text */}
            <div>

                <h1 className="text-2xl font-bold text-slate-800">
                Hi, Anisaaa 👋
                </h1>

                <p className="text-sm text-slate-500">
                Informatics Engineering Student
                </p>

                <p className="text-sm font-medium text-blue-600">
                Target Graduate: April 2027
                </p>

            </div>

            </div>

            {/* Quote */}
            <div className="max-w-sm rounded-xl bg-slate-100 p-3">

            <p className="text-sm leading-relaxed text-slate-700">
                “Small progress every day still matters.”
            </p>

            </div>

        </div>

        </div>

    );
    }