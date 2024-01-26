export const success = (data: any) => Response.json({
  msg: 'success',
  data,
});

export const failed = (status: number, msg: string = 'Something wrong in server.') => new Response(msg, { status });