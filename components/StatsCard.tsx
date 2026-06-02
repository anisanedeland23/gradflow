    type StatsCardProps = {
    title: string;
    value: string;
    description: string;
    };

    export default function StatsCard({
    title,
    value,
    description,
    }: StatsCardProps) {
    return (

        <div className="rounded-2xl bg-slate-100 p-4">

        <p className="text-sm text-slate-500">
            {title}
        </p>

        <h3 className="mt-2 text-3xl font-bold text-slate-800">
            {value}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
            {description}
        </p>

        </div>

    );
    }