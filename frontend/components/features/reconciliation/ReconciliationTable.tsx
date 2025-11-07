import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReconcileRecord } from "@/types/reconcile";

interface ReconciliationTableProps {
  data: ReconcileRecord[];
  loading?: boolean;
}

export function ReconciliationTable({ data, loading }: ReconciliationTableProps): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>投手日报</TableHead>
          <TableHead>财务记录</TableHead>
          <TableHead>金额差 (USDT)</TableHead>
          <TableHead>匹配度</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>创建时间</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground">
              加载中...
            </TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground">
              暂无对账数据
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.ad_spend_id}</TableCell>
              <TableCell>{item.ledger_id ?? "-"}</TableCell>
              <TableCell>{item.amount_diff.toFixed(2)}</TableCell>
              <TableCell>{item.match_score !== null ? `${item.match_score.toFixed(2)}%` : "-"}</TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
      <TableCaption>自动匹配的日报与财务记录列表</TableCaption>
    </Table>
  );
}

function StatusBadge({ status }: { status: string }): JSX.Element {
  const variant =
    status === "matched"
      ? "bg-emerald-100 text-emerald-700"
      : status === "need_review"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-200 text-slate-700";

  const text =
    status === "matched" ? "已匹配" : status === "need_review" ? "待复核" : status === "pending" ? "待处理" : status;

  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${variant}`}>{text}</span>;
}


