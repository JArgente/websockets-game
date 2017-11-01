package configuration;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.enterprise.context.ApplicationScoped;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

@ApplicationScoped
@ServerEndpoint("/saw")
public class WebSocketConfigSaw{
	
	
    private static Session sessionLocal;
    private static List<Session> sessionesMovil= new ArrayList<>();
    
	@OnOpen
    public void open(Session session) {
	//	if(sessionLocal==null){
	//		sessionLocal=session;
	//	}else{
			sessionesMovil.add(session);
			
	//	}
	}
	
	@OnClose
	    public void close(Session session) {

			sessionesMovil.remove(session);
		
	}
	
	@OnError
	    public void onError(Throwable error) {
	}
	
	@OnMessage
	    public void handleMessage(String message, Session session) {
		 try {
			 if(message.equals("localSession")){
				 sessionLocal=session;
				 sessionesMovil.remove(session);
				 for(Session sesion: sessionesMovil){
					 sesion.getBasicRemote().sendText("start");
				 }
			 }else if(message.contains("muerte")){
				 String index=message.substring(message.length()-1);
				 WebSocketConfig.asesinados[Integer.parseInt(index)]=true;

			 }else{
				 sessionLocal.getBasicRemote().sendText(message);
			 }
	        } catch (Exception ex) {
	        	ex.printStackTrace();
	        }
	}

}
