type Props = {
  title: string;
  value: string;
};

export default function StatCard({ title, value }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>
      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}
